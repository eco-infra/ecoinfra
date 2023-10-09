import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand,
  type ConfirmSignUpCommandInput,
  type SignUpCommandInput,
  type InitiateAuthCommandInput
} from "@aws-sdk/client-cognito-identity-provider";

export default class CognitoService {
  CLIENT_ID = "vq3lo6lvlk18dl3rqpj8kqq0h"

  constructor(
    private client = new CognitoIdentityProviderClient({region: "eu-west-1"})
  ) {
  }

  async login(username: string, password: string) {
    const params: InitiateAuthCommandInput = {
      ClientId: this.CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    };

    const command = new InitiateAuthCommand(params);

    return await this.client.send(command)
  }

  async signUp(username: string, password: string) {
    const params: SignUpCommandInput = {
      ClientId: this.CLIENT_ID,
      Password: password,
      UserAttributes: [],
      Username: username
    };

    const command = new SignUpCommand(params);

    await this.client.send(command)
  }

  async confirm(code: string, username: string) {
    const params: ConfirmSignUpCommandInput = {
      ClientId: this.CLIENT_ID,
      ConfirmationCode: code,
      Username: username
    }

    const command = new ConfirmSignUpCommand(params);

    await this.client.send(command)
  }
}