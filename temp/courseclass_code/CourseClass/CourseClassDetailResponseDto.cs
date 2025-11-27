namespace EduManagement.Core.Application.DTOs.CourseClass;

/// <summary>
/// DTO for detailed course class response with extended information
/// </summary>
public class CourseClassDetailResponseDto : CourseClassResponseDto
{
    // Course details
    public string CourseCode { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string SemesterName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;

    // Room details
    public string RoomCode { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int RoomCapacity { get; set; }

    // Instructor details
    public string InstructorCode { get; set; } = string.Empty;
    public string InstructorEmail { get; set; } = string.Empty;
    public DateOnly? InstructorAssignedDate { get; set; }
    public string? Note { get; set; }

    // Schedule details
    public int StartPeriod { get; set; }
    public int EndPeriod { get; set; }
    public string Period { get; set; } = string.Empty; // morning, afternoon, evening

    // Additional statistics
    public decimal FeePerCredit { get; set; }
    public decimal TotalFee { get; set; }
    public double FillRate { get; set; } // Percentage of capacity filled

    // Students list (optional, only when showStudents is true)
    public List<CourseClassStudentDto>? Students { get; set; }
}