import type { InferenceSnippet, ModelDataMinimal } from "./types";
import { describe, expect, it } from "vitest";
import { getPythonInferenceSnippet } from "./python";

describe("inference API snippets", () => {
	it("automatic-speech-recognition", async () => {
		const model: ModelDataMinimal = {
			id: "openai/whisper-large-v3-turbo",
			pipeline_tag: "automatic-speech-recognition",
			tags: [],
			inference: "",
		};
		const snippets = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippets.length).toEqual(2);

		expect(snippets[0].client).toEqual("huggingface_hub");
		expect(snippets[0].content).toEqual(`from huggingface_hub import InferenceClient
client = InferenceClient("openai/whisper-large-v3-turbo", token="api_token")

output = client.automatic_speech_recognition("sample1.flac")`);

		expect(snippets[1].client).toEqual("requests");
		expect(snippets[1].content).toEqual(`import requests

API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo"
headers = {"Authorization": "Bearer api_token"}

def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()

output = query("sample1.flac")`);
	});

	it("conversational llm", async () => {
		const model: ModelDataMinimal = {
			id: "meta-llama/Llama-3.1-8B-Instruct",
			pipeline_tag: "text-generation",
			tags: ["conversational"],
			inference: "",
		};
		const snippet = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippet[0].content).toEqual(`from huggingface_hub import InferenceClient

client = InferenceClient(api_key="api_token")

messages = [
	{
		"role": "user",
		"content": "What is the capital of France?"
	}
]

stream = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct", 
	messages=messages, 
	max_tokens=500,
	stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")`);
	});

	it("conversational llm non-streaming", async () => {
		const model: ModelDataMinimal = {
			id: "meta-llama/Llama-3.1-8B-Instruct",
			pipeline_tag: "text-generation",
			tags: ["conversational"],
			inference: "",
		};
		const snippet = getPythonInferenceSnippet(model, "api_token", { streaming: false }) as InferenceSnippet[];

		expect(snippet[0].content).toEqual(`from huggingface_hub import InferenceClient

client = InferenceClient(api_key="api_token")

messages = [
	{
		"role": "user",
		"content": "What is the capital of France?"
	}
]

completion = client.chat.completions.create(
    model="meta-llama/Llama-3.1-8B-Instruct", 
	messages=messages, 
	max_tokens=500
)

print(completion.choices[0].message)`);
	});

	it("conversational vlm", async () => {
		const model: ModelDataMinimal = {
			id: "meta-llama/Llama-3.2-11B-Vision-Instruct",
			pipeline_tag: "image-text-to-text",
			tags: ["conversational"],
			inference: "",
		};
		const snippet = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippet[0].content).toEqual(`from huggingface_hub import InferenceClient

client = InferenceClient(api_key="api_token")

messages = [
	{
		"role": "user",
		"content": [
			{
				"type": "text",
				"text": "Describe this image in one sentence."
			},
			{
				"type": "image_url",
				"image_url": {
					"url": "https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg"
				}
			}
		]
	}
]

stream = client.chat.completions.create(
    model="meta-llama/Llama-3.2-11B-Vision-Instruct", 
	messages=messages, 
	max_tokens=500,
	stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")`);
	});

	it("document-question-answering", async () => {
		const model: ModelDataMinimal = {
			id: "impira/layoutlm-invoices",
			pipeline_tag: "document-question-answering",
			tags: [],
			inference: "",
		};
		const snippets = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippets.length).toEqual(2);

		expect(snippets[0].client).toEqual("huggingface_hub");
		expect(snippets[0].content).toEqual(`from huggingface_hub import InferenceClient
client = InferenceClient("impira/layoutlm-invoices", token="api_token")

output = client.document_question_answering(cat.png, question=What is in this image?)`);

		expect(snippets[1].client).toEqual("requests");
		expect(snippets[1].content).toEqual(`import requests

API_URL = "https://api-inference.huggingface.co/models/impira/layoutlm-invoices"
headers = {"Authorization": "Bearer api_token"}

def query(payload):
	with open(payload["image"], "rb") as f:
		img = f.read()
		payload["image"] = base64.b64encode(img).decode("utf-8")
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

output = query({
    "inputs": {
		"image": "cat.png",
		"question": "What is in this image?"
	},
})`);
	});

	it("image-to-image", async () => {
		const model: ModelDataMinimal = {
			id: "stabilityai/stable-diffusion-xl-refiner-1.0",
			pipeline_tag: "image-to-image",
			tags: [],
			inference: "",
		};
		const snippets = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippets.length).toEqual(2);

		expect(snippets[0].client).toEqual("huggingface_hub");
		expect(snippets[0].content).toEqual(`from huggingface_hub import InferenceClient
client = InferenceClient("stabilityai/stable-diffusion-xl-refiner-1.0", token="api_token")

# output is a PIL.Image object
image = client.image_to_image("cat.png", prompt="Turn the cat into a tiger.")`);

		expect(snippets[1].client).toEqual("requests");
		expect(snippets[1].content).toEqual(`import requests

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0"
headers = {"Authorization": "Bearer api_token"}

def query(payload):
	with open(payload["inputs"], "rb") as f:
		img = f.read()
		payload["inputs"] = base64.b64encode(img).decode("utf-8")
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content

image_bytes = query({
	"inputs": "cat.png",
	"parameters": {"prompt": "Turn the cat into a tiger."},
})

# You can access the image with PIL.Image for example
import io
from PIL import Image
image = Image.open(io.BytesIO(image_bytes))`);
	});

	it("text-to-image", async () => {
		const model: ModelDataMinimal = {
			id: "black-forest-labs/FLUX.1-schnell",
			pipeline_tag: "text-to-image",
			tags: [],
			inference: "",
		};
		const snippets = getPythonInferenceSnippet(model, "api_token") as InferenceSnippet[];

		expect(snippets.length).toEqual(2);

		expect(snippets[0].client).toEqual("huggingface_hub");
		expect(snippets[0].content).toEqual(`from huggingface_hub import InferenceClient
client = InferenceClient("black-forest-labs/FLUX.1-schnell", token="api_token")

# output is a PIL.Image object
image = client.text_to_image("Astronaut riding a horse")`);

		expect(snippets[1].client).toEqual("requests");
		expect(snippets[1].content).toEqual(`import requests

API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
headers = {"Authorization": "Bearer api_token"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content
image_bytes = query({
	"inputs": "Astronaut riding a horse",
})

# You can access the image with PIL.Image for example
import io
from PIL import Image
image = Image.open(io.BytesIO(image_bytes))`);
	});
});
