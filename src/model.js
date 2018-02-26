export const version = () => "1.0.0";


export  class Sensor{
    constructor(name,type,data){ 

        this._name=name;
        this._type=type;
        this._data=data;
              
    }
    get type() {
        return this._type;                
    }
    get name() {
        return this._name;
    }
    get data() {
        return this._data;
    }
   
}
export class  Data {
    constructor(values) {
       this._values = values;
    }
    get values() {
        return this._values;
    }
    getlastValues(){
        return ' '+this.values[this.values.length-1]+'';
    }

}
