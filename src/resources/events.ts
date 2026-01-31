import { type Event, EventSchema } from '../schemas/events.js';
import { BaseResource } from './base.js';

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
