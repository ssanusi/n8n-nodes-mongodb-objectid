# n8n MongoDB ObjectId Node

This project provides an n8n node that enables the conversion of a string representation of a MongoDB ObjectId into an actual ObjectId instance. This functionality is essential for workflows that require interaction with MongoDB databases.

## Purpose

The primary purpose of this node is to facilitate the transformation of string values into MongoDB ObjectId objects, allowing for seamless integration with MongoDB operations within n8n workflows.

## Installation

To install this node, clone the repository and navigate to the project directory. Then, run the following command to install the necessary dependencies:

```
npm install
```

## Usage

Once installed, you can use the MongoDBObjectId node in your n8n workflows. The node provides a method called `convertToObjectId`, which takes a string input and returns the corresponding ObjectId.

### Example

1. Add the MongoDBObjectId node to your workflow.
2. Provide a string input in the format `ObjectId("5f1d7f3e3a3b3c3d4e5f6a7b")`.
3. The node will output the ObjectId instance that can be used in subsequent MongoDB operations.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.