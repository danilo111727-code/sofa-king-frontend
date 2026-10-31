// Local visual QA only; no alias to this file exists in the production build.
import type {ReactNode} from 'react';
const user={fullName:'Admin local',firstName:'Admin',lastName:'local',primaryEmailAddress:{emailAddress:'admin@example.test'}};
export const ClerkProvider=({children}:{children:ReactNode})=>children;
export const Show=({when,children}:{when:string;children:ReactNode})=>when==='signed-out'?null:children;
export const SignIn=()=>null;
export const SignUp=()=>null;
export const useUser=()=>({user,isLoaded:true,isSignedIn:true});
export const useSession=()=>({isLoaded:true,session:{getToken:async()=>null}});
export const useClerk=()=>({addListener:()=>()=>{},signOut:async()=>{},openUserProfile:()=>{}});
