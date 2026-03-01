import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.append(project_root)

import torch
import coremltools as ct
from src.models.mobilenet_model import AudioMobileNetV2

model = AudioMobileNetV2(n_classes=10, pretrained=False)
model_path = os.path.join(project_root, "models", "3_mobilenet.pth")

model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
model.eval()

example_input = torch.rand(1, 1, 128, 173)

traced_model = torch.jit.trace(model, example_input)

print("Започва конвертиране към CoreML...")
mlmodel = ct.convert(
    traced_model,
    inputs=[ct.TensorType(shape=example_input.shape)]
)

mlmodel.save("SonarMobileNet.mlpackage")
print("✅ Успешно запазен като SonarMobileNet.mlpackage (Размер на входа: 1x1x256x173)!")