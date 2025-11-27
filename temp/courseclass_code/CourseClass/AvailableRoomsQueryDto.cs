namespace EduManagement.Core.Application.DTOs.CourseClass;

public class AvailableRoomsQueryDto
{
    public DateOnly DateStart { get; set; }
    public DateOnly DateEnd { get; set; }
    public int DayOfWeek { get; set; }
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public int? MinCapacity { get; set; }
}
