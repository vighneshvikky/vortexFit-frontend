# Trainer Slot Availability Component

A comprehensive Angular component for managing trainer availability slots with support for both initial consultations and one-on-one sessions.

## Features

### 🗓️ Calendar Interface
- Monthly calendar view with navigation
- Visual representation of available slots
- Today highlighting and current month focus
- Responsive design for mobile and desktop

### 📅 Slot Management
- **Two Slot Types:**
  - **Initial Consultation**: For assessing client fitness level and time preferences
  - **One-on-One Session**: For personalized training sessions

### 🔄 Recurring Slots
- Set default availability for specific days of the week
- Weekly recurring patterns (e.g., every Monday)
- Visual indicators for recurring slots

### ⚡ Dynamic Slot Creation
- Add slots for specific dates
- Set recurring slots for days of the week
- Quick action buttons for common slot types
- Time validation and conflict detection

### 🎨 Modern UI/UX
- Material Design components
- Beautiful gradient header
- Color-coded slot types
- Hover effects and smooth transitions
- Dark mode support

## Component Structure

```
trainer-slot-availability/
├── trainer-slot-availability.component.ts    # Main component logic
├── trainer-slot-availability.component.html  # Template
├── trainer-slot-availability.component.scss  # Styles
├── trainer-slot-availability.component.spec.ts # Tests
└── README.md                                 # This file
```

## Usage

### Basic Implementation

```typescript
// In your module
import { TrainerSlotAvailabilityComponent } from './trainer-slot-availability.component';

@NgModule({
  declarations: [TrainerSlotAvailabilityComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule
  ]
})
export class TrainerModule { }
```

### In Template

```html
<app-trainer-slot-availability></app-trainer-slot-availability>
```

## Data Models

### TimeSlot Interface

```typescript
interface TimeSlot {
  id: string;
  startTime: string;        // Format: "HH:MM"
  endTime: string;          // Format: "HH:MM"
  type: 'initial' | 'one-on-one';
  isRecurring: boolean;
  dayOfWeek?: number;       // 0-6 (Sunday-Saturday)
  specificDate?: Date;      // For non-recurring slots
}
```

### DayAvailability Interface

```typescript
interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
  isRecurring: boolean;
}
```

## Service Integration

The component uses `TrainerSlotService` for data management:

```typescript
// Inject the service
constructor(private slotService: TrainerSlotService) {}

// Add a new slot
const newSlot = this.slotService.addSlot({
  startTime: '09:00',
  endTime: '10:00',
  type: 'initial',
  isRecurring: true,
  dayOfWeek: 1 // Monday
});

// Get slots for a specific date
const slots = this.slotService.getSlotsForDate(new Date());

// Check for recurring slots
const hasRecurring = this.slotService.hasRecurringSlots(date);
```

## Key Features Explained

### 1. Slot Type Distinction

The component clearly distinguishes between two types of slots:

- **Initial Consultation** (Blue theme):
  - Purpose: Assess client fitness level and time preferences
  - Icon: `person_search`
  - Color: Primary blue

- **One-on-One Session** (Orange theme):
  - Purpose: Personalized training session
  - Icon: `fitness_center`
  - Color: Accent orange

### 2. Recurring vs Specific Date Slots

**Recurring Slots:**
- Set once for a day of the week
- Automatically appear on all instances of that day
- Marked with a repeat icon
- Can be edited globally for all instances

**Specific Date Slots:**
- Set for a particular date only
- Override recurring slots for that specific date
- Useful for special events or exceptions

### 3. Time Validation

The component includes comprehensive time validation:

- End time must be after start time
- No overlapping slots on the same day
- Conflict detection for both recurring and specific slots
- Real-time validation feedback

### 4. Calendar Navigation

- Previous/Next month navigation
- Current month highlighting
- Today's date special styling
- Responsive grid layout

## Styling Customization

The component uses SCSS with CSS custom properties for easy theming:

```scss
// Customize colors
:root {
  --primary-color: #2196f3;
  --accent-color: #ff9800;
  --success-color: #4caf50;
  --error-color: #f44336;
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .trainer-slot-availability {
    background: #1a1a1a;
    // ... dark theme styles
  }
}
```

## Responsive Design

The component is fully responsive with breakpoints:

- **Desktop**: Full calendar grid with all features
- **Tablet**: Optimized layout with adjusted spacing
- **Mobile**: Stacked layout with touch-friendly interactions

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

### Required Angular Material Modules

```typescript
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
```

### Angular Core Modules

```typescript
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
```

## Testing

The component includes comprehensive unit tests:

```bash
ng test trainer-slot-availability.component
```

## Future Enhancements

Potential improvements for future versions:

1. **Drag & Drop**: Drag slots between dates
2. **Bulk Operations**: Select multiple slots for batch editing
3. **Import/Export**: CSV/JSON import/export functionality
4. **Advanced Recurring**: Custom recurrence patterns (bi-weekly, monthly)
5. **Integration**: Calendar app integration (Google Calendar, Outlook)
6. **Analytics**: Slot utilization reports and analytics
7. **Notifications**: Email/SMS reminders for upcoming slots

## Contributing

When contributing to this component:

1. Follow Angular style guide
2. Add unit tests for new features
3. Update documentation
4. Ensure responsive design
5. Test across different browsers

## License

This component is part of the VortexFit application and follows the project's licensing terms. 