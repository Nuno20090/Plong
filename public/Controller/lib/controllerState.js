class ControllerState
{
    constructor()
    {
        this.leftPressed        = false,
        this.leftPressedCount   = 0,
        
        this.rightPressed       = false,
        this.rightPressedCount  = 0
    }
    
    IsEqual(other)
    {
        if ((this.leftPressed       != other.leftPressed       ) ||
            (this.leftPressedCount  != other.leftPressedCount  ) ||
            (this.rightPressed      != other.rightPressed      ) ||
            (this.rightPressedCount != other.rightPressedCount ))
        {
            return false;
        }
        return true;
    }

    CopyFrom(other)
    {
        this.leftPressed       = other.leftPressed;
        this.leftPressedCount  = other.leftPressedCount;
        this.rightPressed      = other.rightPressed; 
        this.rightPressedCount = other.rightPressedCount;
    }

    Log()
    {
        console.log(`Controller State`);
        console.log(`  Left Pressed        : ${this.leftPressed      }`);
        console.log(`  Let Pressed Count   : ${this.leftPressedCount }`);
        console.log(`  Right Pressed       : ${this.rightPressed     }`);
        console.log(`  Right Pressed Count : ${this.rightPressedCount}`);
        console.log(` `);
    }
}