import {supabase} from './supabase.js';
export const ls={get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
export async function loadRemote(u){const{data}=await supabase.from('capsules').select('*').eq('user_id',u.id).maybeSingle();return data?{items:data.items,note:data.note,unlock:data.unlock,sealed:data.sealed_on}:null}
export const saveRemote=(u,c)=>supabase.from('capsules').upsert({user_id:u.id,items:c.items,note:c.note,unlock:c.unlock,sealed_on:c.sealed,updated_at:new Date().toISOString()}).then(({error})=>{if(error)throw error});
export const clearRemote=u=>supabase.from('capsules').delete().eq('user_id',u.id);
