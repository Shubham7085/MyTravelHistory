import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId && dbId !== '(default)' 
  ? initializeFirestore(app, { ignoreUndefinedProperties: true }, dbId) 
  : initializeFirestore(app, { ignoreUndefinedProperties: true });
export const auth = getAuth(app);

// Error handling required by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function formatFirestoreError(error: any): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  
  try {
    // Handle cases where the message is a JSON string of FirestoreErrorInfo
    const data = JSON.parse(rawMessage);
    if (data && typeof data === 'object' && 'error' in data && 'operationType' in data && 'path' in data) {
      const { error: rawError, operationType, path, authInfo } = data;
      const isPermissionDenied = rawError.includes('Missing or insufficient permissions') || rawError.includes('permission-denied');
      
      if (isPermissionDenied) {
        let explanation = '';
        const authUser = authInfo?.email || 'unauthenticated';
        const authUid = authInfo?.userId || 'none';

        if (!authInfo?.userId) {
          explanation = `User is not authenticated. Every Firestore request must include the authenticated Firebase user, and this request did not find any signed-in user credentials. Check the global 'isSignedIn()' gate in firestore.rules.`;
        } else if (authInfo.email !== 'shubhamnagvanshi84823@gmail.com' && authInfo.userId !== 'nGpl8tnTF0gXTxqS81bhhUUxr4s2' && authInfo.userId !== 'nGpI8tnTF0gXTxqS81bhhUUxr4s2') {
          explanation = `The authenticated user "${authUser}" (UID: "${authUid}") does not have Admin privilege. The 'isAdmin()' function in firestore.rules restricts writing to this path solely to the authorized administrator account (shubhamnagvanshi84823@gmail.com or UID nGpl8tnTF0gXTxqS81bhhUUxr4s2).`;
        } else {
          // If the admin user is logged in, but permission is still denied, it means schema validation failed.
          explanation = `The 'isAdmin()' check succeeded, but schema validation failed on the 'isValidTrip()', 'isValidPhoto()', or 'isValidVideo()' helper functions in firestore.rules. The payload fields, types, string sizes, or document ID ('isValidId()') violated constraints.`;
        }

        return `Firestore Permission Denied (Missing or insufficient permissions):
• Denied Path: ${path}
• Operation: ${operationType}
• Authenticated User: ${authUser} (UID: ${authUid})
• Blocking Security Rule: ${explanation}
• Native Error: ${rawError}`;
      }
      
      return `Firestore Error on path '${path}' during '${operationType}': ${rawError}`;
    }
  } catch (e) {
    // Not a JSON string, format as normal
  }

  // Fallback check for regular non-JSON Firebase errors
  if (rawMessage.includes('Missing or insufficient permissions') || rawMessage.includes('permission-denied')) {
    const authUser = auth.currentUser?.email || 'unauthenticated';
    const authUid = auth.currentUser?.uid || 'none';
    let explanation = '';
    
    if (!auth.currentUser) {
      explanation = `User is not authenticated. Every Firestore request must include the authenticated Firebase user, and this request did not find any signed-in user credentials. Check the global 'isSignedIn()' gate in firestore.rules.`;
    } else if (auth.currentUser.email !== 'shubhamnagvanshi84823@gmail.com' && auth.currentUser.uid !== 'nGpl8tnTF0gXTxqS81bhhUUxr4s2' && auth.currentUser.uid !== 'nGpI8tnTF0gXTxqS81bhhUUxr4s2') {
      explanation = `The authenticated user "${authUser}" (UID: "${authUid}") does not have Admin privilege. The 'isAdmin()' function in firestore.rules restricts writing to this path solely to the authorized administrator account (shubhamnagvanshi84823@gmail.com or UID nGpl8tnTF0gXTxqS81bhhUUxr4s2).`;
    } else {
      explanation = `The 'isAdmin()' check succeeded, but schema validation failed on the 'isValidTrip()', 'isValidPhoto()', or 'isValidVideo()' helper functions in firestore.rules. The payload fields, types, string sizes, or document ID ('isValidId()') violated constraints.`;
    }

    return `Firestore Permission Denied (Missing or insufficient permissions):
• Authenticated User: ${authUser} (UID: ${authUid})
• Blocking Security Rule: ${explanation}
• Native Error: ${rawMessage}`;
  }

  return rawMessage;
}

// withTimeout helper to prevent indefinite hangs during Firestore operations
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`[Firestore] Operation timed out after ${timeoutMs}ms. Returning fallback.`);
      resolve(fallbackValue);
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn(`[Firestore] Operation failed, returning fallback:`, err);
        resolve(fallbackValue);
      });
  });
}

// withWriteTimeout helper to prevent indefinite hangs during Firestore write operations
export function withWriteTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn(`[Firestore] Write operation timed out after ${timeoutMs}ms.`);
      reject(new Error(errorMsg));
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// CRITICAL CONSTRAINT: Test the connection to Firestore when the app initially boots
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test completed successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    } else {
      console.warn("Firestore connection check info:", error);
    }
  }
}

testConnection();
export default app;
