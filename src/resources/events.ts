import { type RenderEvent, RenderEventSchema } from '../schemas/events.js';
import { BaseResource } from './base.js';

/**
 * Events resource client
 */
export class EventsResource extends BaseResource {
  /**
   * Retrieve an event by ID
   */
  async retrieve(eventId: string): Promise<RenderEvent> {
    const response = await this.http.get<RenderEvent>(`/events/${eventId}`);
    return this.validate(RenderEventSchema, response.data);
  }
}
