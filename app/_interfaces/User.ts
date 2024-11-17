import NextAuth from "next-auth"; 

declare module "next-auth" { 
    interface User { 
        userName?: string | null; 
        userId?: string | null; 
        token?: string | null; 
        refreshToken?: string | null;
    } 
    
    interface Session { 
        user?: User; 
    }
}