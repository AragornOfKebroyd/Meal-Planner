from datetime import datetime, timedelta

def parse_log_line(line):
    # Parse log line and extract timestamp
    timestamp_str = line.split()[0] + ' ' + line.split()[1]
    return datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')

def calculate_development_time(log_file_path, development_duration_threshold):
    with open(log_file_path, 'r') as file:
        lines = file.readlines()

    total_development_time = timedelta()

    for i in range(len(lines) - 1):
        current_time = parse_log_line(lines[i])
        next_time = parse_log_line(lines[i + 1])

        time_difference = next_time - current_time
        if time_difference <= development_duration_threshold:
            total_development_time += time_difference

    return total_development_time



log_file_path = 'C:/Users/benja/Documents/My Documents/School/Years/Year 12-13/Computer Science/Project/Meal Planner/website backend/logs/reqLog.log'
development_duration_threshold = timedelta(minutes=20)

total_development_time = calculate_development_time(log_file_path, development_duration_threshold)

print(f'Total time spent developing: {round(total_development_time.total_seconds() / 60 / 60, 2)} hours (on the frontend)')