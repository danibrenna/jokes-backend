import {resolve} from "path";
import {config} from "dotenv";
export function environment(input: string) { 
  process.on('SIGINT', function() {
    process.exit();
  });
  var path = resolve(__dirname, '../env/.env');
  if(input){
    path = path + '.' + input;
  }
  config({path });
} 