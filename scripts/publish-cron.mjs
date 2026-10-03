const url=process.env.NELAPOST_URL||'https://nelapost.onrender.com'
const res=await fetch(url+'/api/cron/publish',{headers:{Authorization:'Bearer '+(process.env.CRON_SECRET||'')}})
const text=await res.text()
console.log(res.status,text)
if(!res.ok)process.exit(1)
