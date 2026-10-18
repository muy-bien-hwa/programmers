# [ 알고리즘 ]
# 00100 과 같이 문자열로 변경 -> total_times 총 길이 이용해서
# 한 번 루프의 길이가 같은 애들만 돌려서 안된다 = -1
# index = i % total_times 으로 계속 돌리기
# 다 더해서 signals.length 와 같으면 brake, t 반환  

from collections import Counter

def solution(signals):
    signal_str = []
    total_times = []   # 신호등마다 총 시간 저장

    for signal in signals :  # 신호등은 최대 5개
        total_times.append(signal[0] + signal[1] + signal[2]) # total 시간
        signal_str.append("0" * signal[0] + "1" * signal[1] + "0" * signal[2])  # 노란불 일 때만 1, 나머진 0으로 str 형식으로 저장

    # print(signal_str)   # 디버깅용

    c = Counter(total_times)
    for total_time in set(total_times) :   # 총 시간 겹치는 신호등 있는지 검사
        if c[total_time] != 1 :   # 겹치는 애가 있다면
            sum_check = 0
            idxs = [i for i, x in enumerate(total_times) if x == total_time]   # 그 겹치는 애들 index 만 뽑아내기
            for idx in idxs :   # 겹치는 애들 인덱스로 값 뽑아내서 int로 다 더하기.
                sum_check += int(signal_str[idx])

            if str(len(idxs)) in str(sum_check) :  # 겹치는 신호등이 3개다 -> 3개의 signal_str 을 다 더했을 때 "3"이 없으면 모두 노란불 상황 불가능
                continue
            else :
                return -1


    flag = 0
    time = 0   # flag = while 무한 반복문 break 기준
    while True:
        time += 1
        for i in range(len(signals)) :  # 신호등 개수만큼
            # print(int(signal_str[i][(time-1) % total_times[i]]))  # 디버깅용
            flag += int(signal_str[i][(time-1) % total_times[i]])  # index 0이 1초를 의미하므로 time - 1, 총 시간 5초인 신호등, time = 6 일 때는 0번째 index 를 출력해야 함.

        if flag == len(signals):   # flag = 신호등 개수와 같으면 break
            break

        flag = 0    
    return time

## Test
# print(solution([[2, 1, 2], [5, 1, 1]]))   # 13
# print(solution([[2, 3, 2], [3, 1, 3], [2, 1, 1]]))   # 11
# print(solution([[3, 3, 3], [5, 4, 2], [2, 1, 2]]))   # 193
# print(solution([[1, 1, 4], [2, 1, 3], [3, 1, 2], [4, 1, 1]]))   # -1