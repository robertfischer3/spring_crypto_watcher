import pandas as pd


def find_japanese_patterns(historical):
    """
    Load data from the querySet and identify candle patterns.

    Normally, a library would be used to identify candle patterns. A common one
    used in Crypto Analysis is TA -Lib. TA-Lib requires a hard install because it relies on
    Cython.

    Instead, I make use of a simplfied set of algorithms found here:
    https://towardsdatascience.com/how-to-identify-japanese-candlesticks-patterns-in-python-b835d1cc72f7

    :param historical:
    :return:
    """
    df = pd.DataFrame(historical)

    for i in range(2, df.shape[0]):
        current = df.iloc[i, :]
        previous = df.iloc[i - 1, :]
        previous_2 = df.iloc[i - 2, :]

        real_body = abs(current['open'] - current['close'])
        candle_range = current['high'] - current['low']

        idx = df.index[i]

        # Bullish swing
        df.loc[idx, 'Bullish swing'] = current['low'] > previous['low'] and previous['low'] < previous_2['low']

        # Bearish swing
        df.loc[idx, 'Bearish swing'] = current['high'] < previous['high'] and previous['high'] > previous_2['high']

        # Bullish pinbar
        df.loc[idx, 'Bullish pinbar'] = real_body <= candle_range / 3 and min(current['open'], current['close']) > (
                current['high'] + current['low']) / 2 and current['low'] < previous['low']

        # Bearish pinbar
        df.loc[idx, 'Bearish pinbar'] = real_body <= candle_range / 3 and max(current['open'], current['close']) < (
                current['high'] + current['low']) / 2 and current['high'] > previous['high']

        # Inside bar
        df.loc[idx, 'Inside bar'] = current['high'] < previous['high'] and current['low'] > previous['low']

        # Outside bar
        df.loc[idx, 'Outside bar'] = current['high'] > previous['high'] and current['low'] < previous['low']

        # Bullish engulfing
        df.loc[idx, 'Bullish engulfing'] = current['high'] > previous['high'] and current['low'] < previous[
            'low'] and real_body >= 0.8 * candle_range and current['close'] > current['open']

        # Bearish engulfing
        df.loc[idx, 'Bearish engulfing'] = current['high'] > previous['high'] and current['low'] < previous[
            'low'] and real_body >= 0.8 * candle_range and current['close'] < current['open']

    df.fillna(False, inplace=True)
    return df
