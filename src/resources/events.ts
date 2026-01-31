import { BaseResource } from './base.js';
import { EventSchema, type Event } from '../schemas/events.js';

/**
 * Events resource client
 */
export class EventsResource extends BaseResource {
  /**
   * Retrieve an event by ID
   */
  async retrieve(eventId: string): Promise<Event> {
    const response = await this.http.get<Event>(`/events/${eventId}`);
    return this.validate(EventSchema, response.data);
  }
}
