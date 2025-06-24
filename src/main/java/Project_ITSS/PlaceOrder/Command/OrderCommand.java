package Project_ITSS.PlaceOrder.Command;

/**
 * Command interface for order operations
 * Implements Command Pattern
 */
public interface OrderCommand {
    
    /**
     * Execute the command
     */
    CommandResult execute();
    
    /**
     * Undo the command (if possible)
     */
    void undo();
    
    /**
     * Check if command can be executed
     */
    boolean canExecute();
    
    /**
     * Get command description
     */
    String getDescription();
} 