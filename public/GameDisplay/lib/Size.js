
class Size
{
    constructor()
    {
        this.cx = 1;
        this.cy = 1;
    }

    copy(source)
    {
        this.cx = source.cx;
        this.cy = source.cy;
    }

    set(cx, cy)
    {
        this.cx = cx;
        this.cy = cy;
    }
}