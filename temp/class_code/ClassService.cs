using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduManagement.Core.Application.DTOs.Class;
using EduManagement.Core.Application.DTOs.Student;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Application.Interfaces.Services;
using EduManagement.Core.Domain.Entities;

namespace EduManagement.Core.Application.Services;

public class ClassService : IClassService
{
    private readonly IClassRepository _classRepository;

    public ClassService(IClassRepository classRepository)
    {
        _classRepository = classRepository;
    }

    public async Task<ClassListResponseDto> GetAllClassesAsync(ClassFilterDto filter)
    {
        // Ensure filter has valid defaults
        if (filter.Page < 1) filter.Page = 1;
        if (filter.PageSize < 1) filter.PageSize = 10;

        var classes = await _classRepository.GetAllWithDetailsAsync(filter);
        var totalCount = await _classRepository.GetTotalCountAsync(filter);

        var classDtos = classes.Select(c => new ClassDto
        {
            ClassId = c.ClassId,
            ClassCode = c.ClassCode,
            ClassName = c.ClassName,
            DepartmentId = c.DepartmentId,
            DepartmentName = c.Department?.DepartmentName ?? string.Empty,
            FacultyId = c.Department?.FacultyId,
            FacultyName = c.Department?.Faculty?.FacultyName,
            AdvisorInstructorId = c.AdvisorInstructorId,
            AdvisorInstructorName = c.AdvisorInstructor?.Person?.FullName,
            TrainingSystemId = c.TrainingSystemId,
            TrainingSystemName = c.TrainingSystem?.TrainingSystemName ?? string.Empty,
            StartAcademicYearId = c.StartAcademicYearId,
            StartAcademicYearName = c.StartAcademicYear?.YearName ?? string.Empty,
            EndAcademicYearId = c.EndAcademicYearId,
            EndAcademicYearName = c.EndAcademicYear?.YearName ?? string.Empty,
            CurriculumDescPdf = c.CurriculumDescPdf,
            ClassStatus = c.ClassStatus,
            CurriculumId = c.CurriculumId,
            CurriculumName = c.Curriculum?.CurriculumName,
            StudentCount = c.Students?.Count(s => s.IsActive && !s.IsDeleted) ?? 0,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return new ClassListResponseDto
        {
            Classes = classDtos,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = filter.PageSize > 0 ? (int)Math.Ceiling(totalCount / (double)filter.PageSize) : 0
        };
    }

    public async Task<ClassDetailDto?> GetClassByIdAsync(Guid id)
    {
        var classEntity = await _classRepository.GetByIdWithDetailsAsync(id);
        if (classEntity == null) return null;

        return new ClassDetailDto
        {
            ClassId = classEntity.ClassId,
            ClassCode = classEntity.ClassCode,
            ClassName = classEntity.ClassName,
            DepartmentId = classEntity.DepartmentId,
            DepartmentName = classEntity.Department?.DepartmentName ?? string.Empty,
            FacultyId = classEntity.Department?.FacultyId,
            FacultyName = classEntity.Department?.Faculty?.FacultyName,
            AdvisorInstructorId = classEntity.AdvisorInstructorId,
            AdvisorInstructorName = classEntity.AdvisorInstructor?.Person?.FullName,
            TrainingSystemId = classEntity.TrainingSystemId,
            TrainingSystemName = classEntity.TrainingSystem?.TrainingSystemName ?? string.Empty,
            StartAcademicYearId = classEntity.StartAcademicYearId,
            StartAcademicYearName = classEntity.StartAcademicYear?.YearName ?? string.Empty,
            EndAcademicYearId = classEntity.EndAcademicYearId,
            EndAcademicYearName = classEntity.EndAcademicYear?.YearName ?? string.Empty,
            CurriculumDescPdf = classEntity.CurriculumDescPdf,
            ClassStatus = classEntity.ClassStatus,
            CurriculumId = classEntity.CurriculumId,
            CurriculumName = classEntity.Curriculum?.CurriculumName,
            StudentCount = classEntity.Students?.Count ?? 0,
            Students = classEntity.Students?.Select(s => new StudentDto
            {
                StudentId = s.StudentId,
                StudentCode = s.StudentCode,
                FullName = s.Person?.FullName ?? string.Empty,
                Email = s.Person?.Email ?? string.Empty,
                PhoneNumber = s.Person?.PhoneNumber,
                EnrollmentStatus = s.EnrollmentStatus
            }).ToList() ?? new List<StudentDto>(),
            CreatedAt = classEntity.CreatedAt,
            UpdatedAt = classEntity.UpdatedAt
        };
    }

    public async Task<ClassDetailDto> CreateClassAsync(CreateClassDto dto)
    {
        if (!await _classRepository.IsClassCodeUniqueAsync(dto.ClassCode))
            throw new InvalidOperationException($"Mã lớp '{dto.ClassCode}' đã tồn tại");

        if (dto.AdvisorInstructorId.HasValue &&
            !await _classRepository.IsAdvisorFromSameDepartmentAsync(dto.AdvisorInstructorId.Value, dto.DepartmentId))
            throw new InvalidOperationException("Giảng viên cố vấn phải thuộc cùng khoa với lớp học");

        if (dto.CurriculumId.HasValue &&
            !await _classRepository.IsCurriculumFromSameDepartmentAsync(dto.CurriculumId.Value, dto.DepartmentId))
            throw new InvalidOperationException("Chương trình đào tạo phải thuộc cùng chuyên ngành với lớp học");

        if (!await _classRepository.TrainingSystemExistsAsync(dto.TrainingSystemId))
            throw new InvalidOperationException("Hệ đào tạo không tồn tại");

        var endAcademicYearId = await _classRepository.GetOrCreateEndAcademicYearAsync(dto.StartAcademicYearId);

        var classEntity = new Class
        {
            ClassCode = dto.ClassCode,
            ClassName = dto.ClassName,
            DepartmentId = dto.DepartmentId,
            AdvisorInstructorId = dto.AdvisorInstructorId,
            TrainingSystemId = dto.TrainingSystemId,
            StartAcademicYearId = dto.StartAcademicYearId,
            EndAcademicYearId = endAcademicYearId,
            CurriculumId = dto.CurriculumId
        };

        var created = await _classRepository.CreateAsync(classEntity);
        var result = await _classRepository.GetByIdWithDetailsAsync(created.ClassId);
        return (await GetClassByIdAsync(result!.ClassId))!;
    }

    public async Task<ClassDetailDto> UpdateClassAsync(Guid id, UpdateClassDto dto)
    {
        var classEntity = await _classRepository.GetByIdAsync(id);
        if (classEntity == null)
            throw new InvalidOperationException("Không tìm thấy lớp học");

        if (classEntity.ClassStatus == "graduated")
            throw new InvalidOperationException("Không thể sửa đổi lớp đã tốt nghiệp");

        if (dto.AdvisorInstructorId.HasValue &&
            !await _classRepository.IsAdvisorFromSameDepartmentAsync(dto.AdvisorInstructorId.Value, classEntity.DepartmentId))
            throw new InvalidOperationException("Giảng viên cố vấn phải thuộc cùng khoa với lớp học");

        if (dto.CurriculumId.HasValue &&
            !await _classRepository.IsCurriculumFromSameDepartmentAsync(dto.CurriculumId.Value, classEntity.DepartmentId))
            throw new InvalidOperationException("Chương trình đào tạo phải thuộc cùng chuyên ngành với lớp học");

        classEntity.ClassName = dto.ClassName;
        classEntity.AdvisorInstructorId = dto.AdvisorInstructorId;
        classEntity.TrainingSystemId = dto.TrainingSystemId;
        classEntity.ClassStatus = dto.ClassStatus;
        classEntity.CurriculumId = dto.CurriculumId;

        await _classRepository.UpdateAsync(classEntity);
        return (await GetClassByIdAsync(id))!;
    }

    public async Task<bool> DeleteClassAsync(Guid id)
    {
        if (await _classRepository.HasActiveStudentsAsync(id))
            throw new InvalidOperationException("Không thể xóa lớp có sinh viên đang học");

        return await _classRepository.DeleteAsync(id);
    }

    public async Task<List<InstructorBasicDto>> GetAvailableInstructorsByDepartmentIdAsync(Guid departmentId)
    {
        return await _classRepository.GetAvailableInstructorsByDepartmentIdAsync(departmentId);
    }

    public async Task<List<CurriculumBasicDto>> GetAvailableCurriculumsByDepartmentIdAsync(Guid departmentId)
    {
        return await _classRepository.GetAvailableCurriculumsByDepartmentIdAsync(departmentId);
    }

    public async Task<List<TrainingSystemBasicDto>> GetAvailableTrainingSystemsAsync()
    {
        return await _classRepository.GetAvailableTrainingSystemsAsync();
    }
}
