import { INodeType, INodeTypeDescription, IExecuteFunctions, NodeConnectionType } from 'n8n-workflow';
import { ObjectId } from 'mongodb';
import { MongoDBObjectId as MongoDBObjectIdNode } from './nodes/MongoDBObjectId/MongoDBObjectId.node';

class MongoDBObjectIdHelper {
    static convertToObjectId(inputString: string): string {
        try {
            const objectId = new ObjectId(inputString);
            return objectId.toString();
        } catch (error) {
            throw new Error(`Invalid ObjectId format: ${(error as Error).message}`);
        }
    }
}

export class MongoDBObjectIdNodeHelper implements INodeType {
    description: INodeTypeDescription = {
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
        inputs: [{ type: NodeConnectionType.Main }],
        outputs: [{ type: NodeConnectionType.Main }],
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

    async execute(this: IExecuteFunctions) {
        const inputString = this.getNodeParameter('inputString', 0) as string;
        const objectId = MongoDBObjectIdHelper.convertToObjectId(inputString);
        return this.prepareOutputData([{ json: { objectId } }]);
    }
}