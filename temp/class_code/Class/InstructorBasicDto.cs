using System;

namespace EduManagement.Core.Application.DTOs.Class;

public class InstructorBasicDto
{
    public Guid InstructorId { get; set; }
    public string FullName { get; set; } = null!;
}