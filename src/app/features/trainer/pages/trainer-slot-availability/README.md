# Dynamic Trainer Slot Availability Component

A comprehensive time slot management system for trainers to automatically configure and manage their availability schedules with dynamic slot generation.

## 🚀 Key Features

### 🎯 Dynamic Slot Generation
- **Automatic Configuration**: Set up default slots for all working days without manual intervention
- **Separate Session Types**: Independent generation of Initial Consultation and One-on-One Training sessions
- **Flexible Session Selection**: Choose which session types to generate (one or both)
- **Break Duration Management**: Configure gap duration between sessions (no fixed break time)
- **Recurring Patterns**: Generate slots that repeat weekly on selected days
- **Real-time Preview**: Preview generated slots before applying configuration

### ⚙️ Configuration Management
- **Flexible Working Hours**: Configure start and end times for each day
- **Session Duration Control**: Customize duration for different session types
- **Break Duration Control**: Set gap duration between sessions
- **Session Type Selection**: Choose which session types to generate independently
- **Day Selection**: Choose which days of the week to generate slots for
- **Auto-Generation Toggle**: Enable/disable automatic slot generation

### 📅 Calendar Integration
- **Monthly View**: Navigate through months with ease
- **Visual Slot Indicators**: See slot counts and types at a glance
- **Day Details**: Click on any day to view and manage individual slots
- **Active/Inactive Toggle**: Enable or disable slots as needed

## 🎯 Session Types

### 1. Initial Consultation (30 minutes)
- First meeting with clients to understand their needs
- Interactive session for trainer-client introduction
- Shorter duration for initial assessment

### 2. One-on-One Training (60 minutes)
- Individual training sessions with clients
- Full workout and coaching sessions
- Longer duration for comprehensive training

## 📋 Usage Guide

### Initial Setup

1. **Access Configuration Panel**
   - Click "Show Configuration" button
   - Configure your working preferences

2. **Set Session Durations**
   - Initial Consultation: 15-120 minutes (default: 30)
   - One-on-One Training: 30-180 minutes (default: 60)

3. **Configure Working Hours**
   - Set start time (e.g., 09:00)
   - Set end time (e.g., 17:00)

4. **Set Break Duration**
   - Gap duration between sessions (e.g., 15 minutes)

5. **Select Working Days**
   - Choose which days to generate slots for
   - Use "Select All" or "Clear All" for quick selection

5. **Select Session Types**
   - Choose which session types to generate (Initial Consultation, One-on-One Training, or both)

6. **Enable Auto-Generation**
   - Toggle to automatically generate slots when configuration is applied

### Example Configuration

```
Session Durations:
- Initial Consultation: 30 minutes
- One-on-One Training: 60 minutes

Working Hours:
- Start: 09:00
- End: 17:00

Break Duration: 15 minutes (gap between sessions)

Working Days: Monday, Tuesday, Wednesday, Thursday, Friday

Session Types to Generate:
- Initial Consultation: Enabled
- One-on-One Training: Enabled
```

### Generated Slots Example

With the above configuration, the system generates:

**Initial Consultation Slots (30 min sessions with 15 min gaps):**
- 09:00 - 09:30
- 09:45 - 10:15
- 10:30 - 11:00
- 11:15 - 11:45
- 12:00 - 12:30
- 12:45 - 13:15
- 13:30 - 14:00
- 14:15 - 14:45
- 15:00 - 15:30
- 15:45 - 16:15
- 16:30 - 17:00

**One-on-One Training Slots (60 min sessions with 15 min gaps):**
- 09:00 - 10:00
- 10:15 - 11:15
- 11:30 - 12:30
- 12:45 - 13:45
- 14:00 - 15:00
- 15:15 - 16:15
- 16:30 - 17:30

## 🔧 Technical Implementation

### Core Interfaces

```typescript
interface DynamicSlotConfig {
  initialSessionDuration: number;
  oneOnOneSessionDuration: number;
  breakDuration: number;
  workingHours: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
  autoGenerate: boolean;
  generateInitialSessions: boolean;
  generateOneOnOneSessions: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  type: 'initial' | 'one-on-one' | 'group';
  isRecurring: boolean;
  isActive: boolean;
  dayOfWeek?: number;
  specificDate?: Date;
}
```

### Key Methods

- `autoGenerateSlots()`: Generates slots for all configured days
- `generateSlotsForDay(dayOfWeek)`: Creates slots for a specific day
- `generateSlotsForSessionType()`: Generates slots for a specific session type
- `previewGeneratedSlots()`: Shows preview before applying
- `applyDynamicConfig()`: Applies configuration and generates slots

### Service Integration

The component uses `TrainerSlotService` for:
- Slot storage and retrieval
- Calendar data generation
- Slot validation and overlap detection
- Active/inactive slot management

## 🎨 UI Features

### Configuration Panel
- Collapsible configuration form
- Real-time validation
- Preview functionality
- Auto-save configuration

### Calendar View
- Monthly calendar navigation
- Visual slot indicators
- Color-coded slot types
- Responsive design

### Slot Management
- Individual slot activation/deactivation
- Slot deletion
- Visual status indicators
- Hover effects and animations

## 📱 Responsive Design

- Mobile-friendly interface
- Adaptive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔄 Auto-Generation Logic

1. **Clear Existing Slots**: Removes all recurring slots
2. **Generate for Each Day**: Creates slots for each selected day
3. **Session Type Generation**: Generates both initial and one-on-one slots
4. **Break Time Handling**: Skips break time when generating slots
5. **Gap Management**: Adds 5-minute gaps between sessions
6. **Validation**: Ensures no overlapping slots

## 🚀 Benefits

### For Trainers
- **Time Saving**: No manual slot creation required
- **Consistency**: Uniform slot structure across all days
- **Flexibility**: Easy to modify and regenerate
- **Professional**: Clean, organized schedule

### For Users
- **Availability**: Clear visibility of trainer availability
- **Choice**: Multiple session types and durations
- **Booking**: Easy to find suitable time slots
- **Reliability**: Consistent scheduling system

## 🔮 Future Enhancements

- Integration with booking system
- Advanced recurring patterns (bi-weekly, monthly)
- Custom slot templates
- Analytics and reporting
- Multi-trainer support
- Export/import functionality
- Conflict resolution
- Notification system

## 🛠️ Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile and desktop
- Local storage for data persistence
- Material Design components 