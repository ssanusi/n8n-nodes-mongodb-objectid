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
exports.MongoDBObjectId = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const mongodb_1 = require("mongodb");
class MongoDBObjectId {
    constructor() {
        this.description = {
            displayName: 'MongoDB ObjectId',
            name: 'mongoDBObjectId',
            icon: 'file:mongo.png',
            group: ['transform'],
            version: 1,
            description: 'Convert string fields to MongoDB ObjectId format',
            defaults: {
                name: 'MongoDB ObjectId',
                color: '#00BFFF',
            },
            inputs: [{ type: "main" /* NodeConnectionType.Main */ }],
            outputs: [{ type: "main" /* NodeConnectionType.Main */ }],
            properties: [
                {
                    displayName: 'Operation Mode',
                    name: 'operationMode',
                    type: 'options',
                    options: [
                        {
                            name: 'Single Field',
                            value: 'single',
                        },
                        {
                            name: 'Multiple Fields',
                            value: 'multiple',
                        },
                    ],
                    default: 'single',
                    description: 'Whether to convert a single field or multiple fields',
                },
                {
                    displayName: 'Input Field',
                    name: 'inputField',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '_id',
                    description: 'The field containing the string to convert to ObjectId',
                    displayOptions: {
                        show: {
                            operationMode: ['single'],
                        },
                    },
                },
                {
                    displayName: 'Fields to Convert',
                    name: 'fieldsToConvert',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    displayOptions: {
                        show: {
                            operationMode: ['multiple'],
                        },
                    },
                    default: {},
                    options: [
                        {
                            name: 'fields',
                            displayName: 'Fields',
                            values: [
                                {
                                    displayName: 'Field Name',
                                    name: 'fieldName',
                                    type: 'string',
                                    default: '',
                                    placeholder: '_id',
                                    description: 'Name of the field to convert',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add Option',
                    default: {},
                    options: [
                        {
                            displayName: 'Continue on Error',
                            name: 'continueOnError',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to continue processing if an error occurs',
                        },
                        {
                            displayName: 'Skip Invalid',
                            name: 'skipInvalid',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to skip invalid ObjectId strings instead of throwing an error',
                        },
                    ],
                },
            ],
        };
    }
    /**
     * Validates if a string is a valid MongoDB ObjectId
     * @param str - The string to validate
     * @returns boolean indicating if the string is valid
     */
    isValidObjectId(str) {
        if (!str || typeof str !== 'string')
            return false;
        return /^[0-9a-fA-F]{24}$/.test(str);
    }
    /**
     * Converts a string to MongoDB ObjectId
     * @param value - The string to convert
     * @param fieldName - Name of the field being converted (for error context)
     * @returns The converted ObjectId as string
     */
    convertToObjectId(value, fieldName) {
        if (!this.isValidObjectId(value)) {
            throw new Error(`Invalid ObjectId format in field "${fieldName}": "${value}". ObjectId must be a 24-character hexadecimal string.`);
        }
        try {
            return new mongodb_1.ObjectId(value).toString();
        }
        catch (error) {
            throw new Error(`Failed to create ObjectId for field "${fieldName}": ${error.message}`);
        }
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.getInputData();
            const returnData = [];
            const options = this.getNodeParameter('options', 0, {});
            const operationMode = this.getNodeParameter('operationMode', 0);
            for (let i = 0; i < items.length; i++) {
                try {
                    const item = items[i].json;
                    const newItem = Object.assign({}, item);
                    if (operationMode === 'single') {
                        const fieldName = this.getNodeParameter('inputField', i);
                        const value = item[fieldName];
                        if (value === undefined) {
                            throw new Error(`Field "${fieldName}" not found in item`);
                        }
                        try {
                            newItem[fieldName] = this.convertToObjectId(value, fieldName);
                        }
                        catch (error) {
                            if (options.skipInvalid) {
                                newItem[fieldName] = value;
                            }
                            else {
                                throw error;
                            }
                        }
                    }
                    else {
                        const fieldsToConvert = this.getNodeParameter('fieldsToConvert.fields', i, []);
                        for (const field of fieldsToConvert) {
                            const value = item[field.fieldName];
                            if (value === undefined) {
                                throw new Error(`Field "${field.fieldName}" not found in item`);
                            }
                            try {
                                newItem[field.fieldName] = this.convertToObjectId(value, field.fieldName);
                            }
                            catch (error) {
                                if (options.skipInvalid) {
                                    newItem[field.fieldName] = value;
                                }
                                else {
                                    throw error;
                                }
                            }
                        }
                    }
                    returnData.push({
                        json: newItem,
                    });
                }
                catch (error) {
                    if (options.continueOnError) {
                        returnData.push(items[i]);
                        continue;
                    }
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex: i,
                    });
                }
            }
            return [returnData];
        });
    }
}
exports.MongoDBObjectId = MongoDBObjectId;
