import Cocoa
import Vision

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("Usage: swift test_ocr.swift <image_url>")
    exit(1)
}

guard let url = URL(string: arguments[1]),
      let data = try? Data(contentsOf: url),
      let image = NSImage(data: data),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Failed to load image from URL")
    exit(1)
}

let request = VNRecognizeTextRequest { (request, error) in
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: " ")
    print(text)
}

request.recognitionLevel = .accurate
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try? handler.perform([request])
