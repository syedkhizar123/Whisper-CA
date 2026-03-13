import { useAuthCallback } from "./useAuth";
import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Sentry from '@sentry/react-native';


export const useUsersync  = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { mutate: syncUser } = useAuthCallback();
  const hasSynced = useRef(false); // this is used to not run useEffect more than once

  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      syncUser(undefined, {
        onSuccess: (data) => {
          console.log("✅ User synced with backend:", data.name);
         Sentry.logger.info(Sentry.logger.fmt`User synced with backend: ${data.name}` , {
          userId: user.id,
          username: data.name
         })
        },
        onError: (error) => {
          console.log("❌ User sync failed for the user:", error);
           Sentry.logger.info(Sentry.logger.fmt`User synced failed: ${error}` , {
          userId: user.id,
          error: error
         })
        },
      });
    }

    if (!isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn, user, syncUser]);

  return null;
};
