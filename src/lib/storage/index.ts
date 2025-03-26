import { Storage } from '@plasmohq/storage';

// * sync -> sync by google account -> user custom settings
const STORAGE = new Storage(); // sync
// const secure_storage = new SecureStorage(); // sync
export const __get_storage = () => STORAGE;

// * local -> current extension
const LOCAL_STORAGE = new Storage({ area: 'local' }); // local
// const LOCAL_SECURE_STORAGE = new SecureStorage({ area: 'local' }); // local
export const __get_local_storage = () => LOCAL_STORAGE;

// * session -> current session
const SESSION_STORAGE = new Storage({ area: 'session' }); // session
// const session_secure_storage = new SecureStorage({ area: 'session' }); // session
export const __get_session_storage = () => SESSION_STORAGE;
