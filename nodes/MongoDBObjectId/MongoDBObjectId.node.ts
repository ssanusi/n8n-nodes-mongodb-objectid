import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError  } from 'n8n-workflow';
import { ObjectId } from 'mongodb';

export class MongoDBObjectId implements INodeType {
    description: INodeTypeDescription = {
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
        inputs: [{ type: NodeConnectionType.Main }],
        outputs: [{ type: NodeConnectionType.Main }],
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

    /**
     * Validates if a string is a valid MongoDB ObjectId
     * @param str - The string to validate
     * @returns boolean indicating if the string is valid
     */
    protected isValidObjectId(str: string): boolean {
        if (!str || typeof str !== 'string') return false;
        return /^[0-9a-fA-F]{24}$/.test(str);
    }

    /**
     * Converts a string to MongoDB ObjectId
     * @param value - The string to convert
     * @param fieldName - Name of the field being converted (for error context)
     * @returns The converted ObjectId as string
     */
    protected convertToObjectId(value: string, fieldName: string): string {
        if (!this.isValidObjectId(value)) {
            throw new Error(
                `Invalid ObjectId format in field "${fieldName}": "${value}". ObjectId must be a 24-character hexadecimal string.`
            );
        }

        try {
            return new ObjectId(value).toString();
        } catch (error) {
            throw new Error(`Failed to create ObjectId for field "${fieldName}": ${(error as Error).message}`);
        }
    }

    async execute(this: IExecuteFunctions & MongoDBObjectId): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        const options = this.getNodeParameter('options', 0, {}) as {
            continueOnError?: boolean;
            skipInvalid?: boolean;
        };

        const operationMode = this.getNodeParameter('operationMode', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                const item = items[i].json;
                const newItem = { ...item };

                if (operationMode === 'single') {
                    const fieldName = this.getNodeParameter('inputField', i) as string;
                    const value = item[fieldName];

                    if (value === undefined) {
                        throw new Error(`Field "${fieldName}" not found in item`);
                    }

                    try {
                        newItem[fieldName] = this.convertToObjectId(value as string, fieldName);
                    } catch (error) {
                        if (options.skipInvalid) {
                            newItem[fieldName] = value;
                        } else {
                            throw error;
                        }
                    }
                } else {
                    const fieldsToConvert = this.getNodeParameter('fieldsToConvert.fields', i, []) as Array<{
                        fieldName: string;
                    }>;

                    for (const field of fieldsToConvert) {
                        const value = item[field.fieldName];

                        if (value === undefined) {
                            throw new Error(`Field "${field.fieldName}" not found in item`);
                        }

                        try {
                            newItem[field.fieldName] = this.convertToObjectId(
                                value as string,
                                field.fieldName
                            );
                        } catch (error) {
                            if (options.skipInvalid) {
                                newItem[field.fieldName] = value;
                            } else {
                                throw error;
                            }
                        }
                    }
                }

                returnData.push({
                    json: newItem,
                });
            } catch (error) {
                if (options.continueOnError) {
                    returnData.push(items[i]);
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error as Error, {
                    itemIndex: i,
                });
            }
        }

        return [returnData];
    }
}