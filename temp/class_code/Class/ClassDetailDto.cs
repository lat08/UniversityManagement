using System;
using System.Collections.Generic;
using EduManagement.Core.Application.DTOs.Student;

namespace EduManagement.Core.Application.DTOs.Class;

public class ClassDetailDto
{
    public Guid ClassId { get; set; }
    public string ClassCode { get; set; } = null!;
    public string ClassName { get; set; } = null!;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = null!;
    public Guid? FacultyId { get; set; }
    public string? FacultyName { get; set; }
    public Guid? AdvisorInstructorId { get; set; }
    public string? AdvisorInstructorName { get; set; }
    public Guid TrainingSystemId { get; set; }
    public string TrainingSystemName { get; set; } = null!;
    public Guid StartAcademicYearId { get; set; }
    public string StartAcademicYearName { get; set; } = null!;
    public Guid EndAcademicYearId { get; set; }
    public string EndAcademicYearName { get; set; } = null!;
    public string? CurriculumDescPdf { get; set; }
    public string ClassStatus { get; set; } = null!;
    public Guid? CurriculumId { get; set; }
    public string? CurriculumName { get; set; }
    public int StudentCount { get; set; }
    public List<StudentDto> Students { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}