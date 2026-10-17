def solution(X, Y):
    x = sorted(X, reverse=True)
    y = sorted(Y, reverse=True)

    l = []
    i = j = 0  ## 포인터
    
    if set(x) & set(y) == set() :
        return "-1"
    else :     
        while i < len(x) and j < len(y):
            if x[i] == y[j]:
                l.append(x[i])
                i += 1
                j += 1
            elif x[i] > y[j]:
                i += 1
            else:
                j += 1

        if l[0] == "0":
            return "0"
        
        return "".join(l)