export enum CurrentState {
    WELCOME = 'welcome', // password is missing and welcomed is false
    INITIAL = 'initial', // password is missing
    LOCKED = 'locked', // password is set, but locked
    ALIVE = 'alive', // password is set, and unlocked
    ACTION = 'action', // waiting for user action
}
