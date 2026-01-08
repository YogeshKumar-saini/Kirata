export interface IntentStrategy {
    canHandle(text: string, user: any): boolean;
    execute(text: string, user: any): Promise<void>;
}
