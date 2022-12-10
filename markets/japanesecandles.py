import pandas as pd


def find_japanese_patterns(historical):
    """
    Load data from the querySet and identify candle patterns.

    Normally, a library would be used to identify candle patterns. A common one
    used in Crypto Analysis is TA -Lib. TA-Lib requires a hard install because it relies on
    Cython.

    Instead, I make use of a simplified set of algorithms found here:
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
        """
        Individual Calculations are broken out in separate methods to allow for a different
        set of algorithms to be able to replace each calculation once TA Lib is installed 
        at a later point
        """
        # Method to determine if bullish swing is present
        is_bullish_swing(current, df, idx, previous, previous_2)

        # Method to determine if bearish swing is present
        is_bearish_swing(current, df, idx, previous, previous_2)

        # Method to determine if bullish pinbar is present
        is_bullish_pinbar(candle_range, current, df, idx, previous, real_body)

        # Method to determine if bearish pinbar is present
        is_bearish_pinbar(candle_range, current, df, idx, previous, real_body)

        # Method to determine if inside bar is present
        is_inside_bar(current, df, idx, previous)

        # Method to determine if outside bar is present
        is_outside_bar(current, df, idx, previous)

        # Method to determine if a bullish engulfing is present
        is_bullish_engulfing(candle_range, current, df, idx, previous, real_body)

        # Method to determine if outside bar is present
        is_bearish_engulfing(candle_range, current, df, idx, previous, real_body)

    df.fillna(False, inplace=True)
    return df


def is_bearish_engulfing(candle_range, current, df, idx, previous, real_body):
    # Bearish engulfing
    df.loc[idx, 'bearishengulfing'] = current['high'] > previous['high'] and current['low'] < previous[
        'low'] and real_body >= 0.8 * candle_range and current['close'] < current['open']


def is_outside_bar(current, df, idx, previous):
    # Outside bar calculation
    df.loc[idx, 'outsidebar'] = current['high'] > previous['high'] and current['low'] < previous['low']

def is_inside_bar(current, df, idx, previous):
    # Inside bar calculation
    df.loc[idx, 'insidebar'] = current['high'] < previous['high'] and current['low'] > previous['low']


def is_bearish_pinbar(candle_range, current, df, idx, previous, real_body):
    # Bearish pinbar calculation
    df.loc[idx, 'bearishpinbar'] = real_body <= candle_range / 3 and max(current['open'], current['close']) < (
            current['high'] + current['low']) / 2 and current['high'] > previous['high']


def is_bullish_pinbar(candle_range, current, df, idx, previous, real_body):
    # Bullish pinbar calculation
    df.loc[idx, 'bullishpinbar'] = real_body <= candle_range / 3 and min(current['open'], current['close']) > (
            current['high'] + current['low']) / 2 and current['low'] < previous['low']


def is_bearish_swing(current, df, idx, previous, previous_2):
    # Bearish swing calculation
    df.loc[idx, 'bearishswing'] = current['high'] < previous['high'] and previous['high'] > previous_2['high']


def is_bullish_swing(current, df, idx, previous, previous_2):
    # Bullish swing calculation
    df.loc[idx, 'bullishswing'] = current['low'] > previous['low'] and previous['low'] < previous_2['low']


def is_bullish_engulfing(candle_range, current, df, idx, previous, real_body):
    # Bullish engulfing calculation
    df.loc[idx, 'bullishengulfing'] = current['high'] > previous['high'] and current['low'] < previous[
        'low'] and real_body >= 0.8 * candle_range and current['close'] > current['open']
