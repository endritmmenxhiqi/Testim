using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs
{
    public class ExamMonitorHub : Hub
    {
        // Professor Client calls this to start listening for an exam
        public async Task JoinExamGroup(string examId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, examId);
        }

        public async Task LeaveExamGroup(string examId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, examId);
        }
    }
}
