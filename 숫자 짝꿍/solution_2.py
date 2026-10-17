def solution(X, Y):
    answer = ''
    
    x = list(X)
    y = list(Y)
    x.sort(reverse=True)
    y.sort(reverse=True)
    
    l = []

    if set(x) & set(y) == set() :
        return "-1"
    else :
        while(len(x) != 0 and len(y) != 0) :
            if x[0] == y[0] :
                l.append(x[0])
                x.remove(x[0])
                y.remove(y[0])
            elif x[0] > y[0] :
                x.remove(x[0])
            else :
                y.remove(y[0])

        answer = "".join(l)

        if answer[0] == "0" :
            return "0"
                
        
    return answer


## Test
print(solution("100", "2345"))
print(solution("100", "203045"))
print(solution("100", "123450"))
