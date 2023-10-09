import {prompt} from 'enquirer'

interface UserDetails {
  token: string
}

export default class LoginPrompt {
  async getDetails(): Promise<UserDetails> {
    return await prompt<UserDetails>([{
        type: 'input',
        name: 'token',
        message: 'Provide you token',
      }]
    )
  }
}