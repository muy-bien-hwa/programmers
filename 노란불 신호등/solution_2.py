# [ 알고리즘 ]
# 00100 과 같이 문자열로 변경 -> total_times 총 길이 이용 최소 공배수(=신호등 집합의 한 루프) 구해서 그만큼만 루프 돌리기.
# index = i % total_times 으로 계속 돌리기
# 다 더해서 signals.length 와 같으면 brake, t 반환. 안되면 -1 반환

def solution(signals):
    signal_str = []
    total_times = []   # 신호등마다 총 시간 저장

    for signal in signals :  # 신호등은 최대 5개
        total_times.append(signal[0] + signal[1] + signal[2]) # total 시간
        signal_str.append("0" * signal[0] + "1" * signal[1] + "0" * signal[2])  # 노란불 일 때만 1, 나머진 0으로 str 형식으로 저장

    # print(signal_str)   # 디버깅용

    flag = 0
    time = 0   # flag = while 무한 반복문 break 기준
    while True:
        time += 1
        for i in range(len(signals)) :  # 신호등 개수만큼
            flag += int(signal_str[i][(time-1) % total_times[i]])  # index 0이 1초를 의미하므로 time - 1, 총 시간 5초인 신호등, time = 6 일 때는 0번째 index 를 출력해야 함.

        if flag == len(signals):   # flag = 신호등 개수와 같으면 break
            break

        if all(time % total_time == 0 for total_time in total_times) :   # 초기 상태 = 모두 0. 만약 모두 0 인 상태(초기 상태)로 다시 돌아왔다면? = 전체 루프 한 바퀴를 돌았다 = 최소공배수만큼 돌았다.
            return -1    # 최소공배수만큼 돌았다 = 전체 큰 루프 하나를 다 돌았다 = 근데 전부 노란불인 상태가 없다면 -1 return

        flag = 0    
    return time

## Test
# print(solution([[2, 1, 2], [5, 1, 1]]))   # 13
# print(solution([[2, 3, 2], [3, 1, 3], [2, 1, 1]]))   # 11
# print(solution([[3, 3, 3], [5, 4, 2], [2, 1, 2]]))   # 193
# print(solution([[1, 1, 4], [2, 1, 3], [3, 1, 2], [4, 1, 1]]))   # -1