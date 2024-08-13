import { Context, EventBridgeEvent, SQSEvent } from "aws-lambda";
import { Service } from "../types/src";
import { EventBody, EventProvider } from "./types";
import { validateEvent } from "./validate";

export interface EventHandlerConfig<T> {
  eventProvider: EventProvider;
  handler: (
    payload: T,
    publisher: Service,
    event: EventBridgeEvent<"event", EventBody<T>>,
    context: Context
  ) => Promise<void>;
}

export function handleEvent<T>(
  config: EventHandlerConfig<T>
): (event: SQSEvent, context: Context) => Promise<void> {
  return async (event: SQSEvent, context: Context) => {
    try {
      console.log("Received event:", JSON.stringify(event));

      if (event.Records.length === 0) {
        console.warn("No records found in the SQS event");
        return;
      }

      const promises = event.Records.map(async (record) => {
        const eventBridgeEvent = JSON.parse(record.body) as EventBridgeEvent<"event", EventBody<T>>;
        const { payload, publisher } = eventBridgeEvent.detail;

        console.log("Event payload:", JSON.stringify(payload));
        console.log("Event Publisher:", JSON.stringify(publisher));

        try {
          console.log("Validating event payload...");
          const validatedPayload = validateEvent(payload, config.eventProvider.schema);

          console.log("Handling event...");
          await config.handler(validatedPayload, publisher, eventBridgeEvent, context);

          console.log("Event handling completed successfully");
        } catch (error) {
          console.error("Event handling failed:", error);
          throw error;
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error processing event records:", error);
      throw error;
    }
  };
}
