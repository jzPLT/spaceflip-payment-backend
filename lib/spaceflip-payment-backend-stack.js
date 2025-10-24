"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceflipPaymentBackendStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
class SpaceflipPaymentBackendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const paymentsTable = new dynamodb.Table(this, 'PaymentsTable', {
            tableName: 'spaceflip-payments',
            partitionKey: { name: 'deviceId', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        const checkPaymentFunction = new lambda.Function(this, 'CheckPaymentFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
        const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
        const client = new DynamoDBClient({});
        
        exports.handler = async (event) => {
          const deviceId = event.pathParameters.deviceId;
          const result = await client.send(new GetItemCommand({
            TableName: 'spaceflip-payments',
            Key: { deviceId: { S: deviceId } }
          }));
          
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ hasPaid: !!result.Item })
          };
        };
      `),
        });
        const processPaymentFunction = new lambda.Function(this, 'ProcessPaymentFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
        const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
        const client = new DynamoDBClient({});
        
        exports.handler = async (event) => {
          const { deviceId } = JSON.parse(event.body);
          await client.send(new PutItemCommand({
            TableName: 'spaceflip-payments',
            Item: {
              deviceId: { S: deviceId },
              timestamp: { S: new Date().toISOString() }
            }
          }));
          
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true })
          };
        };
      `),
        });
        paymentsTable.grantReadData(checkPaymentFunction);
        paymentsTable.grantWriteData(processPaymentFunction);
        const api = new apigateway.RestApi(this, 'SpaceflipApi', {
            restApiName: 'Spaceflip Payment API',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });
        const payments = api.root.addResource('payments');
        payments.addResource('{deviceId}').addMethod('GET', new apigateway.LambdaIntegration(checkPaymentFunction));
        payments.addMethod('POST', new apigateway.LambdaIntegration(processPaymentFunction));
    }
}
exports.SpaceflipPaymentBackendStack = SpaceflipPaymentBackendStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2VmbGlwLXBheW1lbnQtYmFja2VuZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNwYWNlZmxpcC1wYXltZW50LWJhY2tlbmQtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsbUVBQXFEO0FBQ3JELCtEQUFpRDtBQUNqRCx1RUFBeUQ7QUFHekQsTUFBYSw0QkFBNkIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN6RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sYUFBYSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzlELFNBQVMsRUFBRSxvQkFBb0I7WUFDL0IsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDdkUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtTQUNsRCxDQUFDLENBQUM7UUFFSCxNQUFNLG9CQUFvQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDN0UsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O09BaUI1QixDQUFDO1NBQ0gsQ0FBQyxDQUFDO1FBRUgsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ2pGLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CNUIsQ0FBQztTQUNILENBQUMsQ0FBQztRQUVILGFBQWEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNsRCxhQUFhLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFckQsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdkQsV0FBVyxFQUFFLHVCQUF1QjtZQUNwQywyQkFBMkIsRUFBRTtnQkFDM0IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVzthQUMxQztTQUNGLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7UUFDNUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7Q0FDRjtBQTFFRCxvRUEwRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBjbGFzcyBTcGFjZWZsaXBQYXltZW50QmFja2VuZFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgcGF5bWVudHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnUGF5bWVudHNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ3NwYWNlZmxpcC1wYXltZW50cycsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2RldmljZUlkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgfSk7XG5cbiAgICBjb25zdCBjaGVja1BheW1lbnRGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NoZWNrUGF5bWVudEZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKGBcbiAgICAgICAgY29uc3QgeyBEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQgfSA9IHJlcXVpcmUoJ0Bhd3Mtc2RrL2NsaWVudC1keW5hbW9kYicpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoe30pO1xuICAgICAgICBcbiAgICAgICAgZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZGV2aWNlSWQgPSBldmVudC5wYXRoUGFyYW1ldGVycy5kZXZpY2VJZDtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiAnc3BhY2VmbGlwLXBheW1lbnRzJyxcbiAgICAgICAgICAgIEtleTogeyBkZXZpY2VJZDogeyBTOiBkZXZpY2VJZCB9IH1cbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBoYXNQYWlkOiAhIXJlc3VsdC5JdGVtIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcHJvY2Vzc1BheW1lbnRGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1Byb2Nlc3NQYXltZW50RnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoYFxuICAgICAgICBjb25zdCB7IER5bmFtb0RCQ2xpZW50LCBQdXRJdGVtQ29tbWFuZCB9ID0gcmVxdWlyZSgnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJyk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7fSk7XG4gICAgICAgIFxuICAgICAgICBleHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGRldmljZUlkIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xuICAgICAgICAgIGF3YWl0IGNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICBUYWJsZU5hbWU6ICdzcGFjZWZsaXAtcGF5bWVudHMnLFxuICAgICAgICAgICAgSXRlbToge1xuICAgICAgICAgICAgICBkZXZpY2VJZDogeyBTOiBkZXZpY2VJZCB9LFxuICAgICAgICAgICAgICB0aW1lc3RhbXA6IHsgUzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiB0cnVlIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgcGF5bWVudHNUYWJsZS5ncmFudFJlYWREYXRhKGNoZWNrUGF5bWVudEZ1bmN0aW9uKTtcbiAgICBwYXltZW50c1RhYmxlLmdyYW50V3JpdGVEYXRhKHByb2Nlc3NQYXltZW50RnVuY3Rpb24pO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IGFwaWdhdGV3YXkuUmVzdEFwaSh0aGlzLCAnU3BhY2VmbGlwQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdTcGFjZWZsaXAgUGF5bWVudCBBUEknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBwYXltZW50cyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdwYXltZW50cycpO1xuICAgIHBheW1lbnRzLmFkZFJlc291cmNlKCd7ZGV2aWNlSWR9JykuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjaGVja1BheW1lbnRGdW5jdGlvbikpO1xuICAgIHBheW1lbnRzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHByb2Nlc3NQYXltZW50RnVuY3Rpb24pKTtcbiAgfVxufVxuIl19