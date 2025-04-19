const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const React = require('react');
const ContestScreen = require('../../src/screens/ContestScreen').default;
const { getCurrentUser } = require('../../src/lib/supabase');
const ContestManager = require('../../src/lib/contestManager').default;

jest.mock('../../src/lib/supabase');
jest.mock('../../src/lib/contestManager');

const mockNavigation = { navigate: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ContestScreen', () => {
  it('should open the create contest modal', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user1' });
    ContestManager.prototype.getContests.mockResolvedValue([]);

    const { getByText } = render(<ContestScreen navigation={mockNavigation} route={{}} />);

    const createButton = getByText('Create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Create Contest')).toBeTruthy();
    });
  });

  it('should create a contest successfully', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user1' });
    ContestManager.prototype.createPrivateContest.mockResolvedValue({ success: true, privateCode: 'ABC123' });

    const { getByText, getByPlaceholderText } = render(<ContestScreen navigation={mockNavigation} route={{}} />);

    fireEvent.press(getByText('Create'));

    await waitFor(() => {
      const nameInput = getByPlaceholderText('Enter contest name');
      fireEvent.changeText(nameInput, 'Test Contest');

      const entryFeeInput = getByPlaceholderText('Minimum ₹5');
      fireEvent.changeText(entryFeeInput, '10');

      const maxParticipantsInput = getByPlaceholderText('Between 2-100');
      fireEvent.changeText(maxParticipantsInput, '10');

      fireEvent.press(getByText('Create Contest'));
    });

    await waitFor(() => {
      expect(ContestManager.prototype.createPrivateContest).toHaveBeenCalledWith({
        name: 'Test Contest',
        entry_fee: 10,
        max_participants: 10,
        is_private: false
      });
      expect(getByText('Contest Created!')).toBeTruthy();
    });
  });

  it('should join a contest successfully', async () => {
    getCurrentUser.mockResolvedValue({ id: 'user1' });
    ContestManager.prototype.joinContest.mockResolvedValue({ success: true, contest: { status: 'in_progress' } });

    const { getByText } = render(<ContestScreen navigation={mockNavigation} route={{}} />);

    fireEvent.press(getByText('Join'));

    await waitFor(() => {
      expect(ContestManager.prototype.joinContest).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Quiz', { contestId: expect.any(String) });
    });
  });
}); 