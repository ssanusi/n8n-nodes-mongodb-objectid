"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBObjectIdNodeHelper = void 0;
const mongodb_1 = require("mongodb");
class MongoDBObjectIdHelper {
    static convertToObjectId(inputString) {
        try {
            const objectId = new mongodb_1.ObjectId(inputString);
            return objectId.toString();
        }
        catch (error) {
            throw new Error(`Invalid ObjectId format: ${error.message}`);
        }
    }
}
class MongoDBObjectIdNodeHelper {
    constructor() {
        this.description = {
            displayName: 'MongoDB ObjectId',
            name: 'mongoDBObjectId',
            icon: 'file:mongo.png',
            group: ['transform'],
            version: 1,
            description: 'Convert string to MongoDB ObjectId',
            defaults: {
                name: 'MongoDB ObjectId',
                color: '#00BFFF',
            },
            inputs: [{ type: "main" /* NodeConnectionType.Main */ }],
            outputs: [{ type: "main" /* NodeConnectionType.Main */ }],
            properties: [
                {
                    displayName: 'Input String',
                    name: 'inputString',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: 'Enter the string to convert',
                    description: 'The string representation of the ObjectId to convert.',
                },
            ],
        };
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const inputString = this.getNodeParameter('inputString', 0);
            const objectId = MongoDBObjectIdHelper.convertToObjectId(inputString);
            return this.prepareOutputData([{ json: { objectId } }]);
        });
    }
}
exports.MongoDBObjectIdNodeHelper = MongoDBObjectIdNodeHelper;
