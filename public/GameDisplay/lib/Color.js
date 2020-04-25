
class Color
{
    constructor()
    {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 255;
    }

    copy(other)
    {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        this.a = other.a;
    }
}