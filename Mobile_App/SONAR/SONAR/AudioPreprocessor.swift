import Foundation
import Accelerate

public actor AudioPreprocessor {
    
    let sampleRate: Float = 22050.0
    let nFft = 2048
    let hopLength = 512
    let nMels = 128
    let fMin: Float = 0.0
    let fMax: Float = 8000.0
    
    private var setup: vDSP_DFT_Setup?
    private var window: [Float]
    
    // Правим го константа (let), защото се създава само веднъж
    private let melFilterBank: [[Float]]
    
    public init() {
        // 1. Създаваме прозореца
        var tempWindow = [Float](repeating: 0, count: 2048) // nFft = 2048
        vDSP_hann_window(&tempWindow, vDSP_Length(2048), Int32(vDSP_HANN_NORM))
        self.window = tempWindow
        
        // 2. Създаваме FFT конфигурацията
        self.setup = vDSP_DFT_zop_CreateSetup(nil, vDSP_Length(2048), vDSP_DFT_Direction.FORWARD)
        
        self.melFilterBank = Self.generateMelFilterBank(sampleRate: 22050.0, nFft: 2048, nMels: 128, fMin: 0.0, fMax: 8000.0)
    }
    
    deinit {
        if let setup = setup { vDSP_DFT_DestroySetup(setup) }
    }
    
    // MARK: - Основната функция (Audio -> Мел Матрица)
    public func processToMelSpectrogram(audioSamples: [Float]) throws -> [[Float]] {
        // Pre-emphasis: y[n] = x[n] - 0.97 * x[n-1]
        let cleanSamples = applyPreEmphasis(samples: audioSamples)
        
        let targetSamples = Int(sampleRate * 4.0)
        var fixedSamples = cleanSamples
        if fixedSamples.count > targetSamples {
            fixedSamples = Array(fixedSamples.prefix(targetSamples))
        } else if fixedSamples.count < targetSamples {
            fixedSamples.append(contentsOf: [Float](repeating: 0, count: targetSamples - fixedSamples.count))
        }
        let padLength = nFft / 2
        var paddedSamples = [Float](repeating: 0, count: padLength)
        paddedSamples.append(contentsOf: fixedSamples)
        paddedSamples.append(contentsOf: [Float](repeating: 0, count: padLength))
        
        let expectedFrames = 173
        var melSpectrogram = [[Float]](repeating: [Float](repeating: 0, count: expectedFrames), count: nMels)
        
        var realPart = [Float](repeating: 0, count: nFft)
        var imagPart = [Float](repeating: 0, count: nFft)
        var outReal = [Float](repeating: 0, count: nFft)
        var outImag = [Float](repeating: 0, count: nFft)
        var magnitude = [Float](repeating: 0, count: nFft / 2)
        var powerSpec = [Float](repeating: 0, count: nFft / 2)
        
        var rawMelSpectrogram = [[Float]](repeating: [Float](repeating: 0, count: expectedFrames), count: nMels)
        var maxMelValue: Float = 1e-10
        
        for t in 0..<expectedFrames {
            let offset = t * hopLength
            for i in 0..<nFft {
                if offset + i < paddedSamples.count {
                    realPart[i] = paddedSamples[offset + i] * window[i]
                } else {
                    realPart[i] = 0
                }
                imagPart[i] = 0
            }
            
            vDSP_DFT_Execute(setup!, &realPart, &imagPart, &outReal, &outImag)
            
            var dsReal = Array(outReal.prefix(nFft / 2))
            var dsImag = Array(outImag.prefix(nFft / 2))
            
            dsReal.withUnsafeMutableBufferPointer { realPtr in
                dsImag.withUnsafeMutableBufferPointer { imagPtr in
                    if let realBase = realPtr.baseAddress, let imagBase = imagPtr.baseAddress {
                        var splitComplex = DSPSplitComplex(realp: realBase, imagp: imagBase)
                        vDSP_zvabs(&splitComplex, 1, &magnitude, 1, vDSP_Length(nFft / 2))
                    }
                }
            }
            
            vDSP_vsq(magnitude, 1, &powerSpec, 1, vDSP_Length(nFft / 2))
            
            for m in 0..<nMels {
                var melValue: Float = 0
                for f in 0..<(nFft / 2) {
                    melValue += powerSpec[f] * melFilterBank[m][f]
                }
                rawMelSpectrogram[m][t] = melValue
                if melValue > maxMelValue {
                    maxMelValue = melValue
                }
            }
        }
        
        // 2) librosa.power_to_db еквивалент
        let topDb: Float = 80.0
        let refDb = 10.0 * log10(max(maxMelValue, 1e-10))
        
        for m in 0..<nMels {
            for t in 0..<expectedFrames {
                let melValue = rawMelSpectrogram[m][t]
                let powerDb = 10.0 * log10(max(melValue, 1e-10))
                
                // Subtract refDb, bound by topDb
                let dbScaled = powerDb - refDb
                let dbThreshold = -topDb
                let finalDb = max(dbScaled, dbThreshold)
                
                // Scale to 0..1 (като в тренировката)
                melSpectrogram[m][t] = (finalDb + topDb) / topDb
            }
        }
        
        return melSpectrogram
    }
    
    private func applyPreEmphasis(samples: [Float]) -> [Float] {
        guard !samples.isEmpty else { return samples }
        var out = [Float](repeating: 0, count: samples.count)
        out[0] = samples[0]
        for i in 1..<samples.count {
            out[i] = samples[i] - 0.97 * samples[i - 1]
        }
        return out
    }
    
    // MARK: - Статична математическа функция (без 'self')
    private static func generateMelFilterBank(sampleRate: Float, nFft: Int, nMels: Int, fMin: Float, fMax: Float) -> [[Float]] {
        var filterBank = [[Float]](repeating: [Float](repeating: 0, count: nFft / 2), count: nMels)
        
        // Преобразуване към Мел скала (инлайннато, за да няма нужда от други функции)
        let melMin = 2595.0 * log10(1.0 + fMin / 700.0)
        let melMax = 2595.0 * log10(1.0 + fMax / 700.0)
        
        let melPoints = stride(from: melMin, through: melMax, by: (melMax - melMin) / Float(nMels + 1)).map { $0 }
        
        // Преобразуване обратно към Hz и намиране на "кошчетата" (bins)
        let hzPoints = melPoints.map { 700.0 * (pow(10.0, $0 / 2595.0) - 1.0) }
        let binPoints = hzPoints.map { Int(floor(($0 * Float(nFft)) / sampleRate)) }
        
        for m in 0..<nMels {
            let left = binPoints[m]
            let center = binPoints[m + 1]
            let right = binPoints[m + 2]
            for k in left..<center { filterBank[m][k] = Float(k - left) / Float(center - left) }
            for k in center..<right { filterBank[m][k] = Float(right - k) / Float(right - center) }
        }
        
        return filterBank
    }
}
