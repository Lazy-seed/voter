import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';

const VoterPage = () => {
  const [poll, setPoll] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedNomineeId, setVotedNomineeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    try {
      const res = await apiClient.get('/poll');
      setPoll(res.data.poll);
      setNominees(res.data.nominees);
      setHasVoted(res.data.hasVoted);
      setVotedNomineeId(res.data.votedNomineeId);
      setLoading(false);
    } catch (err) {
      setError('Failed to load poll. Is the server running?');
      setLoading(false);
    }
  };

  const handleVote = async (nomineeId) => {
    if (hasVoted) return;

    try {
      await apiClient.post('/vote', {
        pollId: poll._id,
        nomineeId
      });
      setHasVoted(true);
      setVotedNomineeId(nomineeId);
      setSuccessMsg('Your vote has been cast successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote.');
    }
  };

  if (loading) return <div className="text-center">Loading poll...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!poll) return <div className="text-center">No active polls found.</div>;

  return (
    <div className="glass-container animate-fade-in">
      <div className="text-center">
        <h1>{poll.title}</h1>
        <p>{poll.description}</p>
        
        {hasVoted && (
          <div className="success-message mt-4">
            {successMsg || "You have already voted in this session. Thank you!"}
          </div>
        )}
      </div>

      <div className="nominees-grid">
        {nominees.map((nominee) => (
          <div 
            key={nominee._id} 
            className={`nominee-card ${votedNomineeId === nominee._id ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
            onClick={() => !hasVoted && handleVote(nominee._id)}
            style={{ opacity: hasVoted && votedNomineeId !== nominee._id ? 0.6 : 1 }}
          >
            <div className="nominee-name">{nominee.name}</div>
            <div className="nominee-bio">{nominee.bio}</div>
            
            <button 
              className="btn mt-2" 
              disabled={hasVoted}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              {votedNomineeId === nominee._id ? '✓ Voted' : 'Vote'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoterPage;
