import {createClient, type SupabaseClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

export const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://fouoyzmgfalyphqecpdq.supabase.co'
export function admin():SupabaseClient{
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!key)throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
 return createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}})
}
export async function installationId(){const c=await cookies();return c.get('nelapost_installation_id')?.value||crypto.randomUUID()}
export async function canConnect(id:string,platform:string){
 const db=admin();const {data,error}=await db.from('social_connections').select('platform').eq('installation_id',id)
 if(error)throw error
 return (data||[]).some(x=>x.platform===platform)||(data||[]).length<3
}
function secretKeyBytes(){const secret=process.env.TOKEN_ENCRYPTION_KEY;if(!secret)throw new Error('TOKEN_ENCRYPTION_KEY is not configured');return crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret))}
function b64(bytes:ArrayBuffer|Uint8Array){return Buffer.from(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes)).toString('base64url')}
function unb64(value:string){return new Uint8Array(Buffer.from(value,'base64url'))}
export async function encryptSecret(value:string){const keyBytes=await secretKeyBytes();const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(value));return `${b64(iv)}.${b64(ciphertext)}`}
export async function decryptSecret(value:string){const [ivPart,dataPart]=value.split('.');if(!ivPart||!dataPart)throw new Error('Invalid encrypted secret');const keyBytes=await secretKeyBytes();const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(ivPart)},key,unb64(dataPart));return new TextDecoder().decode(plaintext)}
export async function saveConnection(input:{installation_id:string;platform:string;access_token:string;refresh_token?:string|null;token_expires_at?:string|null;external_account_id?:string|null;external_account_name?:string|null;metadata?:Record<string,unknown>}){
 const db=admin();const encryptedAccess=await encryptSecret(input.access_token);const encryptedRefresh=input.refresh_token?await encryptSecret(input.refresh_token):null
 const {error}=await db.from('social_connections').upsert({installation_id:input.installation_id,platform:input.platform,access_token:encryptedAccess,refresh_token:encryptedRefresh,token_expires_at:input.token_expires_at||null,external_account_id:input.external_account_id||null,external_account_name:input.external_account_name||null,metadata:input.metadata||{},updated_at:new Date().toISOString()},{onConflict:'installation_id,platform'})
 if(error)throw error
}