export class Origin {
    originXInDots: number;
    originYInDots:number;
    constructor( orginXInDots: number, orginYInDots: number){
        if(orginXInDots < 0 || orginYInDots < 0)
            throw new Error("Origin cannot have negative values.")

        this.originXInDots = orginXInDots;
        this.originYInDots = orginYInDots;
    }
}