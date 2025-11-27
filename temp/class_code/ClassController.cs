using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EduManagement.Core.Application.DTOs.Class;
using EduManagement.Core.Application.DTOs.Common;
using EduManagement.Core.Application.Interfaces.Services;
using TrainingSystemBasicDto = EduManagement.Core.Application.DTOs.Class.TrainingSystemBasicDto;

namespace EduManagement.Presentation.Controllers.v1;

[ApiController]
[Route("v1/class")]
public class ClassController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassController(IClassService classService)
    {
        _classService = classService;
    }

    /// <summary>
    /// Lấy danh sách lớp học
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllClasses([FromQuery] ClassFilterDto filter)
    {
        try
        {
            // Ensure filter is not null and has valid defaults
            filter ??= new ClassFilterDto();
            if (filter.Page < 1) filter.Page = 1;
            if (filter.PageSize < 1) filter.PageSize = 10;

            var result = await _classService.GetAllClassesAsync(filter);
            return Ok(ApiResponse<ClassListResponseDto>.SuccessResponse(
                result,
                "Lấy danh sách lớp học thành công"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách lớp học"
            ));
        }
    }

    /// <summary>
    /// Lấy thông tin lớp học theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetClassById(Guid id)
    {
        try
        {
            var result = await _classService.GetClassByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy lớp học"
                ));

            return Ok(ApiResponse<ClassDetailDto>.SuccessResponse(
                result,
                "Lấy thông tin lớp học thành công"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy thông tin lớp học"
            ));
        }
    }

    /// <summary>
    /// Tạo lớp học mới
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        try
        {
            var result = await _classService.CreateClassAsync(dto);
            return StatusCode(201, ApiResponse<ClassDetailDto>.SuccessResponse(
                result,
                "Tạo lớp học thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi tạo lớp học"
            ));
        }
    }

    /// <summary>
    /// Cập nhật thông tin lớp học
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClass(Guid id, [FromBody] UpdateClassDto dto)
    {
        try
        {
            var result = await _classService.UpdateClassAsync(id, dto);
            return Ok(ApiResponse<ClassDetailDto>.SuccessResponse(
                result,
                "Cập nhật lớp học thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi cập nhật lớp học"
            ));
        }
    }

    /// <summary>
    /// Xóa lớp học
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(Guid id)
    {
        try
        {
            var result = await _classService.DeleteClassAsync(id);
            if (!result)
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "Không tìm thấy lớp học"
                ));

            return Ok(ApiResponse<object>.SuccessResponse(
                new { classId = id, isDeleted = true },
                "Xóa lớp học thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi xóa lớp học"
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách giảng viên có thể làm cố vấn theo chuyên ngành
    /// </summary>
    [HttpGet("available-instructors/{departmentId}")]
    public async Task<IActionResult> GetAvailableInstructors(Guid departmentId)
    {
        try
        {
            var instructors = await _classService.GetAvailableInstructorsByDepartmentIdAsync(departmentId);
            return Ok(ApiResponse<List<InstructorBasicDto>>.SuccessResponse(
                instructors,
                "Lấy danh sách giảng viên thành công"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách giảng viên"
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách chương trình đào tạo theo chuyên ngành
    /// </summary>
    [HttpGet("available-curriculums/{departmentId}")]
    public async Task<IActionResult> GetAvailableCurriculums(Guid departmentId)
    {
        try
        {
            var curriculums = await _classService.GetAvailableCurriculumsByDepartmentIdAsync(departmentId);
            return Ok(ApiResponse<List<CurriculumBasicDto>>.SuccessResponse(
                curriculums,
                "Lấy danh sách chương trình đào tạo thành công"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách chương trình đào tạo"
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách hệ đào tạo
    /// </summary>
    [HttpGet("available-training-systems")]
    public async Task<IActionResult> GetAvailableTrainingSystems()
    {
        try
        {
            var trainingSystems = await _classService.GetAvailableTrainingSystemsAsync();
            return Ok(ApiResponse<List<TrainingSystemBasicDto>>.SuccessResponse(
                trainingSystems,
                "Lấy danh sách hệ đào tạo thành công"
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "Lỗi khi lấy danh sách hệ đào tạo"
            ));
        }
    }


}
