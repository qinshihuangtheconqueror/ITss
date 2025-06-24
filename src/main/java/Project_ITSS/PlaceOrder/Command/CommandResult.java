package Project_ITSS.PlaceOrder.Command;

/**
 * Result class for command operations
 */
public class CommandResult {
    private boolean success;
    private String message;
    private Object data;
    private String errorCode;
    private long executionTime;
    
    public CommandResult() {
        this.executionTime = System.currentTimeMillis();
    }
    
    public CommandResult(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public CommandResult(boolean success, String message, Object data) {
        this(success, message);
        this.data = data;
    }
    
    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    
    public long getExecutionTime() { return executionTime; }
    public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
    
    // Convenience methods
    public static CommandResult success(String message) {
        return new CommandResult(true, message);
    }
    
    public static CommandResult success(String message, Object data) {
        return new CommandResult(true, message, data);
    }
    
    public static CommandResult failure(String message) {
        return new CommandResult(false, message);
    }
    
    public static CommandResult failure(String message, String errorCode) {
        CommandResult result = new CommandResult(false, message);
        result.setErrorCode(errorCode);
        return result;
    }
} 