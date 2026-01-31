import { type User, UserSchema } from '../schemas/users.js';
import { BaseResource } from './base.js';

/**
 * Users resource client
 */
export class UsersResource extends BaseResource {
  /**
   * Get the authenticated user
   */
  async me(): Promise<User> {
    const response = await this.http.get<User>('/users');
    return this.validate(UserSchema, response.data);
  }
}
