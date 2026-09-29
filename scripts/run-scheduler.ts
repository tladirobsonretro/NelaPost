import {runScheduledPosts} from '../lib/scheduler'
runScheduledPosts().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1)})
